import * as  path from 'path'
import fs from 'fs-extra'
import * as chalk from 'chalk'
import * as globby from 'globby'
import exec from '../utils/exec'
import { confirm } from 'terminal-input'

let cwd = process.cwd()
const tags = ['beta', 'rc']


const tasks = [
    {
        describe: 'tag检查',
        action(options) {
            let result = true

            const { tag } = options
            if (tag && tags.includes(tag)) {
                console.log(chalk.red(`\n✗ 发布的tag参数只能是beta或rc\n`))
                result = false
            }
            return result
        }
    },
    {
        describe: '代码版本状态检查',
        async action() {
            let result = true
            const msg = await exec('git status', {}, true)
            const logs = msg.split('\n')
            const isCommitOk = !!logs.find(log => log === 'nothing to commit, working tree clean')

            if (!isCommitOk) {
                logs.filter(log => log.indexOf('modified:') > 0)
                    .map(log => log.split(':')[1])
                    .forEach(field => console.log(chalk.red(`✗ ${field}`)))

                result = await confirm('以上文件存在未提交的修改，确认要发布吗？', 'n')

            }
            return result
        }
    },
    {
        describe: '发布参数检查',
        async action(options) {
            let result = true
            if (!options.target) {
                if (options.isForce) {
                    console.log(chalk.red(`\n✗ 禁止强制发布全量模块\n`))
                    result = false
                } else {
                    result = await confirm('没有输入发布包路径，确认要全量发布？', 'n')
                }
            } else if (options.isForce) {
                result = await confirm('确认要强制发布？', 'n')
            }
        }
    },
    {
        describe: '发布流程',
        async action(options, distDir = 'dist') {
            let result = true
            const root = path.resolve(options.dist || 'dist')
            const packageJSONPaths = await globby(
                ['**/package.json', '!**/node_modules/**/*', '!**/{template,temp}?(s)/**/*'],
                { cwd: root, dot: false }
            )
            const packagePaths = packageJSONPaths.map(n => path.dirname(n))
            const { tag } = options
            const promises = packagePaths.map(async packagePath => {
                const packageJson = await fs.readJSON(path.join(packagePath, 'package.json'))
                const packageVersion = packageJson.version
                const packageName = packageJson.name
                if (!tag && tags.some(item => packageVersion.indexOf(item) !== -1)) {
                    console.log(chalk.red(`✗ ${packageName}@${packageVersion} 需要加 --tag 发布`))
                    result = false
                } else if (tag && packageVersion.indexOf(tag) === -1) {
                    console.log(chalk.red(`✗ ${packageName}@${packageVersion} 版本号与tag参数 ${tag} 不匹配`))
                    result = false
                }
                if (result) {
                    console.log(`发布 ${packagePath}@${packageName}`)
                    await exec('npm publish', { cwd: packagePath })
                }
            })
            await promises
            return result
        }
    }
]


const run = async (options?) => {
    options = options || {}
    cwd = options.cwd || cwd
    for (let task of tasks) {
        console.time(task.describe)
        try {
            await task.action(options || {})
        } catch (e) {
            console.error(task.describe, e)
        }
        console.timeEnd(task.describe)
    }
    console.log('publish 执行完毕')
}

export default run