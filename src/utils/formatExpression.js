/**
 * 把内部表达式转换成便于阅读的数学写法。
 *
 * 内部表达式必须保持 ASCII——后端文法里就是 sqrt(、abs(、pi 这些名字，
 * 直接改会牵动接口和解析器。所以界面单独做一层显示转换：
 *
 *   sqrt(2)   →  √(2)
 *   abs(-7)   →  |-7|
 *   pi        →  π
 *   200*10%   →  200×10%
 *   9-4       →  9−4
 *
 * 只影响显示，发送给后端的始终是原始表达式。
 */

/**
 * 需要整体替换的前缀。
 *
 * closer 表示这个前缀自带的左括号在界面上对应的右半部分长什么样：
 * sqrt( 仍然配右括号，abs( 则要配一条竖线，常量 pi 没有括号。
 */
const PREFIX_RULES = [
  { raw: 'sqrt(', display: '√(', closer: ')' },
  { raw: 'abs(', display: '|', closer: '|' },
  { raw: 'pi', display: 'π', closer: null }
]

/**
 * 按钮一次性插入的整块内容，退格时整体删除。
 *
 * 函数名只能由按钮插入（键盘快捷键只放行数字和运算符），所以这里可以放心地
 * 把它们当成一个整体：否则退格删到一半会露出 `sqrt`、`abs` 这种内部代码写法。
 * 按长度从长到短排列，保证先匹配到更长的那个。
 */
export const ATOMIC_INPUT_TOKENS = [
  'sqrt(',
  'abs(',
  'sin(',
  'cos(',
  'tan(',
  'log(',
  'ln(',
  'pi'
]

/**
 * 转换表达式用于展示。
 *
 * <p>abs( 的左右括号在界面上要变成一对竖线，而用户可能还没输入右括号，
 * 所以这里用一个栈记录每个左括号对应的右半部分应该显示成什么。
 *
 * @param {string} raw 内部表达式
 * @returns {string} 用于展示的数学写法
 */
export function toDisplayExpression(raw) {
  if (!raw) {
    return ''
  }

  let result = ''
  const pendingClosers = []
  let index = 0

  while (index < raw.length) {
    const rule = PREFIX_RULES.find((item) => raw.startsWith(item.raw, index))
    if (rule) {
      result += rule.display
      if (rule.closer) {
        pendingClosers.push(rule.closer)
      }
      index += rule.raw.length
      continue
    }

    const char = raw[index]
    if (char === '(') {
      result += '('
      pendingClosers.push(')')
    } else if (char === ')') {
      result += pendingClosers.pop() === '|' ? '|' : ')'
    } else if (char === '*') {
      result += '×'
    } else if (char === '/') {
      result += '÷'
    } else if (char === '-') {
      // 统一用数学减号，和键盘上的「−」以及 ×、÷ 保持一致
      result += '−'
    } else {
      result += char
    }
    index += 1
  }

  return result
}
