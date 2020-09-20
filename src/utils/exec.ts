
const util = require('util')
const exec = util.promisify(require('child_process').exec)

/**
 * command 支持字符串数组或者字符串，如: exec('git status') 或者 exec(['git status','git branch'])
 * 当command为数组时，返回的也会是数组字符串,否则为字符串
 */
export default async (command, options?, silent?) => {
    const commands = [].concat(command)
    let messages = []
    for (let command of commands) {
        try {
            const stdio = await exec(command, { stdio: 'inherit', ...options })
            if (!silent && stdio.stderr && !stdio.stdout) {
                return Promise.reject(new Error(stdio.stderr))
            }
            messages.push(stdio.stdout || stdio.stderr)
        } catch (error) {
            messages.push(error.message)
        }
    }
    return Array.isArray(command) ? messages : messages[0]
}