// pages/index/index.js
const app = getApp()

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月']

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

Page({
  data: {
    year: 0,
    month: 0,
    monthLabel: '',
    weekdays: WEEKDAYS,
    days: [],
    stats: {},
    todayStr: '',
    showModal: false,
    modalDate: '',
    modalHasRecord: false,
    modalRecordId: '',
    modalRecordNote: '',
    noteInput: ''
  },

  onLoad() {
    const today = new Date()
    const todayStr = formatDate(today)
    this.setData({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      todayStr
    })
    this.renderCalendar()
    this.loadStats()
  },

  onShow() {
    this.renderCalendar()
    this.loadStats()
  },

  renderCalendar() {
    const { year, month, todayStr } = this.data
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()

    const records = app.getRecords()
    const recordMap = {}
    records.forEach(r => { recordMap[r.date] = r })

    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push({ empty: true })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      const dateStr = `${year}-${mm}-${dd}`
      const isToday = dateStr === todayStr
      const record = recordMap[dateStr] || null
      const hasRecord = !!record

      let numClass = ''
      if (isToday && hasRecord) numClass = 'num-today-record'
      else if (isToday) numClass = 'num-today'
      else if (hasRecord) numClass = 'num-record'

      days.push({
        empty: false,
        day: d,
        date: dateStr,
        isToday,
        hasRecord,
        recordId: record ? record.id : '',
        recordNote: record ? record.note : '',
        numClass,
        dotClass: isToday ? 'dot dot-white' : 'dot'
      })
    }

    this.setData({
      days,
      monthLabel: `${year}年${MONTH_NAMES[month - 1]}`
    })
  },

  loadStats() {
    this.setData({ stats: app.getStats() })
  },

  prevMonth() {
    let { year, month } = this.data
    month--
    if (month < 1) { month = 12; year-- }
    this.setData({ year, month })
    this.renderCalendar()
  },

  nextMonth() {
    let { year, month } = this.data
    month++
    if (month > 12) { month = 1; year++ }
    this.setData({ year, month })
    this.renderCalendar()
  },

  goToToday() {
    const today = new Date()
    this.setData({
      year: today.getFullYear(),
      month: today.getMonth() + 1
    })
    this.renderCalendar()
  },

  onDayTap(e) {
    const { date } = e.currentTarget.dataset
    if (!date) return

    const records = app.getRecords()
    const record = records.find(r => r.date === date) || null

    this.setData({
      showModal: true,
      modalDate: date,
      modalHasRecord: !!record,
      modalRecordId: record ? record.id : '',
      modalRecordNote: record ? record.note : '',
      noteInput: ''
    })
  },

  onLogToday() {
    const { todayStr } = this.data
    const records = app.getRecords()
    const record = records.find(r => r.date === todayStr) || null

    this.setData({
      showModal: true,
      modalDate: todayStr,
      modalHasRecord: !!record,
      modalRecordId: record ? record.id : '',
      modalRecordNote: record ? record.note : '',
      noteInput: ''
    })
  },

  onNoteInput(e) {
    this.setData({ noteInput: e.detail.value })
  },

  onAddRecord() {
    const { modalDate, noteInput } = this.data
    const result = app.addRecord(modalDate, noteInput)
    if (result.success) {
      wx.showToast({ title: '记录成功', icon: 'success' })
      this.setData({ showModal: false })
      this.renderCalendar()
      this.loadStats()
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  onDeleteRecord() {
    const { modalRecordId, modalDate } = this.data
    if (!modalRecordId) return
    wx.showModal({
      title: '删除记录',
      content: `确定删除 ${modalDate} 的洗头记录吗？`,
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          app.deleteRecord(modalRecordId)
          wx.showToast({ title: '已删除', icon: 'success' })
          this.setData({ showModal: false })
          this.renderCalendar()
          this.loadStats()
        }
      }
    })
  },

  onCloseModal() {
    this.setData({ showModal: false })
  },

  noop() {}
})
