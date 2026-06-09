const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'data', 'quizzes.json');
const quizzes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

quizzes.push({
  id: "geography-expert",
  title: "World Geography Challenge",
  category: "Geography",
  difficulty: "Hard",
  duration: 1200,
  questionsCount: 5,
  rating: 4.9,
  takenCount: 300,
  description: "Test your knowledge of the world's most obscure and fascinating geographical facts.",
  questions: [
    {
      id: "geo-1",
      questionText: "What is the only country in the world that does not have a rectangular flag?",
      options: ["Switzerland", "Vatican City", "Nepal", "Bhutan"],
      correctAnswer: 2,
      explanation: "Nepal's flag is the only national flag that is not rectangular. It is composed of two stacked triangles.",
      topic: "Flags",
      imageUrl: null
    },
    {
      id: "geo-2",
      questionText: "Which is the longest river in the world?",
      options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
      correctAnswer: 1,
      explanation: "The Nile River is traditionally considered the longest river in the world, stretching over 6,600 kilometers.",
      topic: "Rivers",
      imageUrl: null
    },
    {
      id: "geo-3",
      questionText: "What is the smallest country in the world by land area?",
      options: ["Monaco", "Nauru", "San Marino", "Vatican City"],
      correctAnswer: 3,
      explanation: "Vatican City, an independent city-state enclaved within Rome, Italy, is the smallest country in the world by both area and population.",
      topic: "Countries",
      imageUrl: null
    },
    {
      id: "geo-4",
      questionText: "Which continent covers the largest surface area?",
      options: ["Africa", "North America", "Asia", "Antarctica"],
      correctAnswer: 2,
      explanation: "Asia is the largest continent in the world, covering about 30% of the Earth's total land area.",
      topic: "Continents",
      imageUrl: null
    },
    {
      id: "geo-5",
      questionText: "Mount Everest is located on the border of which two countries?",
      options: ["India and Nepal", "Nepal and China", "China and Bhutan", "India and China"],
      correctAnswer: 1,
      explanation: "Mount Everest is located in the Himalayas on the border between Nepal and the Tibet Autonomous Region of China.",
      topic: "Mountains",
      imageUrl: null
    }
  ]
});

quizzes.push({
  id: "movie-buff",
  title: "Cinema Classics",
  category: "Entertainment",
  difficulty: "Medium",
  duration: 600,
  questionsCount: 5,
  rating: 4.8,
  takenCount: 850,
  description: "Are you a true cinephile? Test your knowledge of classic Hollywood cinema and pop culture movies.",
  questions: [
    {
      id: "mov-1",
      questionText: "Who directed the 1994 classic 'Pulp Fiction'?",
      options: ["Martin Scorsese", "Steven Spielberg", "Quentin Tarantino", "Christopher Nolan"],
      correctAnswer: 2,
      explanation: "Pulp Fiction was written and directed by Quentin Tarantino.",
      topic: "Directors",
      imageUrl: null
    },
    {
      id: "mov-2",
      questionText: "Which movie holds the record for the highest grossing film of all time?",
      options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"],
      correctAnswer: 0,
      explanation: "Avatar (2009) holds the record as the highest-grossing film of all time.",
      topic: "Box Office",
      imageUrl: null
    },
    {
      id: "mov-3",
      questionText: "What is the name of the fictional African country where Black Panther is set?",
      options: ["Genosha", "Wakanda", "Zamunda", "Latveria"],
      correctAnswer: 1,
      explanation: "Wakanda is a fictional country located in sub-Saharan Africa, home to the superhero Black Panther.",
      topic: "Marvel",
      imageUrl: null
    },
    {
      id: "mov-4",
      questionText: "Which actor played the role of Jack Dawson in 'Titanic'?",
      options: ["Brad Pitt", "Johnny Depp", "Tom Cruise", "Leonardo DiCaprio"],
      correctAnswer: 3,
      explanation: "Leonardo DiCaprio starred as Jack Dawson in the 1997 film Titanic.",
      topic: "Actors",
      imageUrl: null
    },
    {
      id: "mov-5",
      questionText: "In 'The Matrix', what color is the pill Neo takes to discover the truth?",
      options: ["Blue", "Red", "Green", "Yellow"],
      correctAnswer: 1,
      explanation: "Morpheus offers Neo a choice: take the red pill to learn the truth about the Matrix, or the blue pill to return to his former life.",
      topic: "Plot Details",
      imageUrl: null
    }
  ]
});

fs.writeFileSync(filePath, JSON.stringify(quizzes, null, 2));
console.log('Successfully added new quizzes to quizzes.json');
