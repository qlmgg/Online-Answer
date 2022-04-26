import { createStore } from 'vuex'

const store = createStore({
    state: {
        token: undefined,
        user: undefined,
        searchState: undefined
    },
    getters: {

    },
    mutations: {
        updateToken(state, value) {
            state.token = value
        },
        updateUser(state, value) {
            state.user = value
        },
        updatesearchState(state, value) {
            state.searchState = value
        }
    },
    actions: {

    },
    modules: {

    }
})

export default store
