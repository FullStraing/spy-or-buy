// Tiny element builder. Text always goes through textContent, so content is XSS-safe.

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag)
  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return
    if (key === 'class') el.className = value
    else if (key === 'text') el.textContent = value
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value)
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value)
    else el.setAttribute(key, value === true ? '' : String(value))
  })
  children.flat().forEach((child) => {
    if (child === null || child === undefined || child === false) return
    el.append(child instanceof Node ? child : document.createTextNode(String(child)))
  })
  return el
}

export function mount(root, node) {
  root.replaceChildren(node)
}

export function meter({ label, value, max, tone, display }) {
  const pct = Math.round((Math.max(0, Math.min(value, max)) / max) * 100)
  return h(
    'div',
    { class: `meter meter-${tone}`, role: 'meter', 'aria-label': label, 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': max },
    h('div', { class: 'meter-label' }, h('span', { text: label }), h('b', { text: display })),
    h('div', { class: 'meter-track' }, h('div', { class: 'meter-fill', style: { width: `${pct}%` } })),
  )
}

export function linkButton({ href, label, className = 'btn btn-ghost' }) {
  return h('a', { class: className, href, target: '_blank', rel: 'noopener noreferrer', text: label })
}
