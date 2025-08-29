import React, { createContext, useReducer } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import MyFridge from "./Pages/MyFridge";
import Cart from "./Pages/Cart";
import Recipes from "./Pages/Recipes";
import Community from "./Pages/Community";
import MyFridgeUpload from "./Pages/MyFridgeUpload";
import DHome from "./Pages/DHome";
import DNew from "./Pages/DNew";
import CartUpload from "./Pages/CartUpload";
import DDiary from "./Pages/DDiary";
import "./App.css";
export const DiaryStateContext = createContext([]);
export const DiaryDispatchContext = createContext(() => {});

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Layout>
                            <MyFridge />
                        </Layout>
                    }
                />
                <Route
                    path="/MyFridge"
                    element={
                        <Layout>
                            <MyFridge />
                        </Layout>
                    }
                />
                <Route
                    path="/Cart"
                    element={
                        <Layout>
                            <Cart />
                        </Layout>
                    }
                />
                <Route
                    path="/Recipes"
                    element={
                        <Layout>
                            <Recipes />
                        </Layout>
                    }
                />
                <Route
                    path="/Community"
                    element={
                        <Layout>
                            <Community />
                        </Layout>
                    }
                />
                <Route
                    path="/MyFridgeUpload"
                    element={
                        <Layout>
                            <MyFridgeUpload />
                        </Layout>
                    }
                />
                <Route
                    path="/DHome"
                    element={
                        <Layout>
                            <DHome />
                        </Layout>
                    }
                />
                <Route
                    path="/DNew"
                    element={
                        <Layout>
                            <DNew />
                        </Layout>
                    }
                />
                <Route
                    path="/CartUpload"
                    element={
                        <Layout>
                            <CartUpload />
                        </Layout>
                    }
                />
                <Route
                    path="/DDiary/:id"
                    element={
                        <Layout>
                            <DDiary />
                        </Layout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
