

function getHeaderLabels(table: Element): string[] {
    const headRows = table.querySelectorAll('.p-datatable-thead > tr')
    const headRow = headRows[headRows.length - 1]
    if (!headRow) return []
  
    return Array.from(headRow.children).map((th) => {
      const title = th.querySelector('.p-datatable-column-title')
      return ((title ? title.textContent : th.textContent) ?? '').trim()
    })
  }
  
  function applyLabels(table: Element): void {
    const labels = getHeaderLabels(table)
    if (!labels.length) return
  
    table.querySelectorAll('.p-datatable-tbody > tr').forEach((tr) => {
      
      if (tr.classList.contains('p-datatable-empty-message')) return
  
      Array.from(tr.children).forEach((td, i) => {
        const label = labels[i]
        if (label) {
          if (td.getAttribute('data-label') !== label) td.setAttribute('data-label', label)
        } else if (td.hasAttribute('data-label')) {
          td.removeAttribute('data-label')
        }
      })
    })
  }
  
  function applyAll(): void {
    document.querySelectorAll('.p-datatable').forEach(applyLabels)
  }
  
  export function initTableLabels(): void {
    let scheduled = false
  
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        applyAll()
      })
    }
  
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
    })
  
    schedule()
  }