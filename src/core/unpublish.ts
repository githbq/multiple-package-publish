import * as  path from 'path'
import fs from 'fs-extra'
import * as globby from 'globby'
import exec from '../utils/exec'
import { confirm } from 'terminal-input'

let cwd = process.cwd()

const tasks = [
    {
        describe: '处理dist目录',
        async action(options) {
            let result = true
            const dist = path.resolve(cwd, options.dist || 'dist')
            await fs.removeDir(dist)
            await fs.ensurceDir(dist)
        }
    },
    {
        describe: '二次确认',
        async action(options) {
            let result = true
            const { version } = options
            if (!version) return
            const confirmUnpublish = await confirm(`确认要批量下架 ${version} 版本`, 'n')
            if (!confirmUnpublish) {
                result = false
            } else {
                console.log(`下架版本：${version}`)
            }
            return result
        }
    },
    {
        describe: '取消发布',
        async action(options) {
            let result = true
            const { version } = options
            const root = path.resolve(cwd, options.dist || 'dist')
            const packageJSONPaths = await globby(
                ['**/package.json', '!**/node_modules/**/*', '!**/{template,temp}?(s)/**/*'],
                { cwd: root, dot: false }
            )
            const promises = packageJSONPaths.map(async (packageJSONPath, index) => {
                const packagePath = path.dirname(packageJSONPath)
                const packageJSON = await fs.readJSON(packageJSONPath)
                const unpublishVersion = `${packageJSON.name}  ${version}`
                console.log(`下架 ${unpublishVersion}`)
                await exec(`npm unpublish ${unpublishVersion}`, { cwd: packagePath })
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
            const result = await task.action(options || {})
            if (!result) break
        } catch (e) {
            console.error(task.describe, e)
        }
        console.timeEnd(task.describe)
    }
    console.log('publish 执行完毕')
}

export default run