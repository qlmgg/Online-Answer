import { createStore } from 'vuex'
import {
    UPDATE_USER_MUTATION,
    UPDATE_TOKEN_MUTATION,
    UPDATE_SEARCH_MUTATION,
    UPDATE_CENTER_PAPERS_MUTATION,
} from '../types/mutation.js'

const store = createStore({
    strict: true,
    state: {
        token: undefined,
        user: undefined,
        searchState: undefined,
        centerPapersState: undefined
    },
    getters: {

    },
    mutations: {
        [UPDATE_TOKEN_MUTATION](state, value) {
            state.token = value
        },
        [UPDATE_USER_MUTATION](state, value) {
            state.user = value
        },
        [UPDATE_SEARCH_MUTATION](state, value) {
            state.searchState = value
        },
        [UPDATE_CENTER_PAPERS_MUTATION](state, value) {
            state.centerPapersState = value
        }
    },
    actions: {
        updateUser({ commit }, payload) {
            commit(UPDATE_USER_MUTATION, payload)
            if (payload === undefined) {
                console.log('removeUser');
                localStorage.removeItem('onlineanswer_user')
                return
            }
            try {
                console.log('saveUser');
                localStorage.setItem("onlineanswer_user", JSON.stringify(payload));
            } catch (e) {
                console.log('保存user到本地失败', e);
            }
        },
        updateToken({ commit }, payload) {
            commit(UPDATE_TOKEN_MUTATION, payload)
            if (payload === undefined) {
                console.log('removeToken');
                localStorage.removeItem('onlineanswer_token')
                return
            }
            try {
                console.log('saveToken');
                localStorage.setItem("onlineanswer_token", payload);
            } catch (e) {
                console.log('保存token到本地失败', e);
            }
        }
    },
    modules: {

    }
})

export default store
