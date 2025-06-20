import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  Container,
  Grid,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import Timer from "./Timer";

const QuizPage = () => {
  // Sample quiz data
  const quizData = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Madrid"],
      correctAnswer: "Paris",
    },
    {
      id: 2,
      question: "Which language is used in React?",
      options: ["Python", "Java", "JavaScript", "C++"],
      correctAnswer: "JavaScript",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [timeUp, setTimeUp] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  // Handle answer selection
  const handleAnswerSelect = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion]: option,
    });
  };

  // Flag a question for review
  const handleFlagQuestion = () => {
    if (flagged.includes(currentQuestion)) {
      setFlagged(flagged.filter((q) => q !== currentQuestion));
    } else {
      setFlagged([...flagged, currentQuestion]);
    }
  };

  // Submit quiz
  const handleSubmit = () => {
    setOpenSubmitDialog(true);
  };

  const confirmSubmit = () => {
    alert("Quiz submitted! Answers: " + JSON.stringify(answers));
    setOpenSubmitDialog(false);
  };

  // Timer expiry
  const handleTimeUp = () => {
    setTimeUp(true);
    handleSubmit();
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        {/* Header (Quiz Title & Timer) */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">General Knowledge Quiz</Typography>
          <Timer initialTime={1800} onTimeUp={handleTimeUp} /> {/* 30 minutes */}
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={((currentQuestion + 1) / quizData.length) * 100}
          sx={{ my: 2 }}
        />

        {/* Question & Options */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h6">
            Question {currentQuestion + 1}: {quizData[currentQuestion].question}
          </Typography>

          <RadioGroup
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswerSelect(e.target.value)}
          >
            {quizData[currentQuestion].options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            Previous
          </Button>

          <Box>
            <IconButton onClick={handleFlagQuestion} color={flagged.includes(currentQuestion) ? "warning" : "default"}>
              <FlagIcon />
            </IconButton>

            {currentQuestion < quizData.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            )}
          </Box>
        </Box>

        {/* Question Navigation Sidebar (Optional) */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2">Jump to Question:</Typography>
          <Grid container spacing={1}>
            {quizData.map((q, index) => (
              <Grid item key={index}>
                <Button
                  variant={
                    currentQuestion === index
                      ? "contained"
                      : flagged.includes(index)
                      ? "outlined"
                      : answers[index]
                      ? "contained"
                      : "outlined"
                  }
                  color={
                    currentQuestion === index
                      ? "primary"
                      : flagged.includes(index)
                      ? "warning"
                      : answers[index]
                      ? "success"
                      : "default"
                  }
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Submit Confirmation Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit? You cannot change answers afterward.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button onClick={confirmSubmit} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizPage;