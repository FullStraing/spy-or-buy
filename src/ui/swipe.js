// Pointer-based swipe for the suspect card. Right = approve, left = flag.

const THRESHOLD_PX = 90
const ROTATE_DIVISOR = 18

export function attachSwipe(el, { onDecide }) {
  let startX = null
  let activeId = null
  let dx = 0

  const setDrag = (value) => {
    el.style.setProperty('--drag', String(Math.max(-1, Math.min(1, value / THRESHOLD_PX))))
    el.style.transform = value ? `translateX(${value}px) rotate(${value / ROTATE_DIVISOR}deg)` : ''
  }
  const isActive = (e) => startX !== null && e.pointerId === activeId
  const reset = () => {
    startX = null
    activeId = null
    dx = 0
    el.classList.remove('dragging')
  }

  const onDown = (e) => {
    if (!e.isPrimary || startX !== null) return
    if (e.button !== undefined && e.button !== 0) return
    startX = e.clientX
    activeId = e.pointerId
    dx = 0
    el.setPointerCapture?.(e.pointerId)
    el.classList.add('dragging')
  }
  const onMove = (e) => {
    if (!isActive(e)) return
    dx = e.clientX - startX
    setDrag(dx)
  }
  const onUp = (e) => {
    if (!isActive(e)) return
    const distance = dx
    reset()
    if (Math.abs(distance) >= THRESHOLD_PX) {
      onDecide(distance > 0 ? 'approve' : 'flag')
      return
    }
    setDrag(0)
  }
  const onCancel = (e) => {
    if (!isActive(e)) return
    reset()
    setDrag(0)
  }

  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', onCancel)
  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
    el.removeEventListener('pointercancel', onCancel)
  }
}
