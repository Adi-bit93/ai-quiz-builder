import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import ViewQuiz from './pages/ViewQuiz';
import EditQuiz from './pages/EditQuiz';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />}></Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<Dashboard />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/quizzes/create' element={<CreateQuiz />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/quizzes/:id' element={<ViewQuiz />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/quizzes/:id/update' element={<EditQuiz />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App