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
import QuizAI from './pages/QuizAI';
import JoinQuiz from './pages/JoinQuiz';
import QuizStart from './pages/QuizStart';
import QuizResult from './pages/QuizResult';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />}></Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<Dashboard />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/ai' element={<QuizAI />}></Route>
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
           <Route path='/join' element={<JoinQuiz/>}></Route>
           <Route path='/quiz-start' element={<QuizStart/>}></Route>
           <Route path='/quiz-result' element={<QuizResult/>}></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App