import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../services/api/api.js';


const QuizPage = () => {
  const { id } = useParams();
  const { request } = useApi();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");
        // Fetch quiz by id from backend
        const data = await request(`/admin/quiz/${id}`);
        if (!data.quiz) throw new Error("Quiz not found");
        setQuiz(data.quiz);
      } catch (err) {
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, request]);

  if (loading) return <div style={{textAlign: 'center', marginTop: '40px'}}>Loading quiz...</div>;
  if (error) return <div style={{textAlign: 'center', marginTop: '40px', color: 'red'}}>{error}</div>;
  if (!quiz) return null;

  return (
    <div style={{textAlign: 'center', marginTop: '40px'}}>
      <h1>Ready to Start?</h1>
      <p>Get ready for the <b>{quiz.level}</b> level of <b>{quiz.technology}</b> quiz</p>
      <div style={{margin: '20px auto', maxWidth: 400, background: '#f8fafc', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef'}}>
        <div><b>Questions:</b> {quiz.totalQuestions || (quiz.questions ? quiz.questions.length : 0)}</div>
        <div><b>Time Limit:</b> {quiz.timeLimit} min</div>
      </div>
      {/* Add your quiz UI here */}
    </div>
  );
};

export default QuizPage;
