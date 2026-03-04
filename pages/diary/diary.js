// pages/diary/diary.js
const app = getApp()

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

Page({
  data: {
    records: [],
    showEditModal: false,
    editingId: '',
    editingDate: '',
    editNote: ''
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const raw = app.getRecords()
    const records = raw.map((r, i) => {
      const date = new Date(r.date)
      const weekday = WEEKDAY_NAMES[date.getDay()]

      let daysBetween = null
      if (i < raw.length - 1) {
        const curr = new Date(r.date)
        const prev = new Date(raw[i + 1].date)
        daysBetween = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
      }

      const intervalWarn = daysBetween !== null && daysBetween > 7

      return {
        id: r.id,
        date: r.date,
        note: r.note,
        weekday,
        daysBetween,
        intervalWarn,
        isLast: i === raw.length - 1
      }
    })

    this.setData({ records })
  },

  onDeleteRecord(e) {
    const { id, date } = e.currentTarget.dataset
    wx.showModal({
      title: '删除记录',
      content: `确定删除 ${date} 的洗头记录吗？`,
      confirmText: '删除',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          app.deleteRecord(id)
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadRecords()
        }
      }
    })
  },

  onOpenEdit(e) {
    const { id, date, note } = e.currentTarget.dataset
    this.setData({
      showEditModal: true,
      editingId: id,
      editingDate: date,
      editNote: note || ''
    })
  },

  onNoteInput(e) {
    this.setData({ editNote: e.detail.value })
  },

  onSaveNote() {
    const { editingId, editNote } = this.data
    app.updateNote(editingId, editNote)
    wx.showToast({ title: '已保存', icon: 'success' })
    this.setData({ showEditModal: false })
    this.loadRecords()
  },

  onCloseModal() {
    this.setData({ showEditModal: false })
  },

  goToCalendar() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  noop() {}
})
