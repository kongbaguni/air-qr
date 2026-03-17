export default {
  namespaced: true,
  state: { menuVisible: false },
  mutations: {
    SET_MENU_VISIBLE(state, v) { state.menuVisible = v }
  },
  actions: {
    setMenuVisible({ commit }, v) { commit('SET_MENU_VISIBLE', v) }
  },
  getters: {
    menuVisible: s => s.menuVisible
  }
}
