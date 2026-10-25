/*
CreateSlice is a function that accepts an initial state, an object of reducer functions, and a "slice name", and automatically generates action types that correspond to the reducers and state. 
*/

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false,
    userData : null
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        login : (state,action)=>{
            state.status = true

             // action.payload contains the data passed with an action when it is dispatched, and reducers use this data to update the state.

            // state.userData = action.payload
            // OR
            state.userData = action.payload.userData
        },
        logout : (state)=>{
            state.status = false
            state.userData = null
        }
    }
})

export const {login,logout} = authSlice.actions
export default authSlice.reducer