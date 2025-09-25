// src/utils/i18nMapper.js
import i18n from '@/i18n/index.js' // 导入你的 i18n 实例

/**
 * 根据源文本和语言，获取目标语言的对应翻译
 * @param {string} text - 源文本（如中文“提交”）
 * @param {string} fromLang - 源语言（如 'zh'）
 * @param {string} toLang - 目标语言（如 'en'）
 * @returns {string|undefined} 目标语言的翻译（未找到则返回 undefined）
 */
export function getTranslation(text, fromLang, toLang) {
  // 获取源语言和目标语言的语言包
  const fromMessages = i18n.global.messages[fromLang]
  const toMessages = i18n.global.messages[toLang]
  
  if (!fromMessages || !toMessages) return undefined

  // 递归遍历语言包，找到文本对应的键（支持嵌套结构）
  const findKeyByText = (obj, targetText, currentKey = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = currentKey ? `${currentKey}.${key}` : key
      if (typeof value === 'string') {
        if (value === targetText) {
          return fullKey // 返回找到的键（如 'button.submit'）
        }
      } else if (typeof value === 'object') {
        const result = findKeyByText(value, targetText, fullKey)
        if (result) return result
      }
    }
    return null
  }

  // 找到源文本对应的键
  const key = findKeyByText(fromMessages, text)
  if (!key) return undefined

  // 根据键获取目标语言的翻译（支持嵌套键）
  const getValueByKey = (obj, key) => {
    return key.split('.').reduce((acc, k) => acc?.[k], obj)
  }

  return getValueByKey(toMessages, key)
}