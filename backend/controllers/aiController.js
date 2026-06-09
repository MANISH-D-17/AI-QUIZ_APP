const Quiz = require("../models/Quiz");

exports.generateQuiz = async (req, res, next) => {
  const { topic, difficulty, count } = req.body;

  const questionsPool = {
    Python: [
      {
        questionText: "What does the `pass` statement do in Python?",
        options: ["Exits the current loop", "Skips the rest of the function block", "Does absolutely nothing (null statement placeholder)", "Raises a StopIteration exception"],
        correctAnswer: 2,
        explanation: "The `pass` statement in Python is a null operation. It is used as a placeholder when a statement is syntactically required but no action is needed.",
        topic: "Syntax"
      },
      {
        questionText: "How do you define a dictionary in Python?",
        options: ["my_dict = []", "my_dict = ()", "my_dict = {}", "my_dict = dict()"],
        correctAnswer: 2,
        explanation: "Dictionaries in Python are initialized using curly braces `{}` containing key-value pairs or via `dict()` constructor.",
        topic: "Data Structures"
      },
      {
        questionText: "What is the output of `print(2 * 3 ** 2)` in Python?",
        options: ["36", "18", "12", "64"],
        correctAnswer: 1,
        explanation: "Exponentiation `**` has higher precedence than multiplication `*`. So `3 ** 2 = 9`, then `2 * 9 = 18`.",
        topic: "Operators"
      },
      {
        questionText: "Which function converts a value into a floating-point number?",
        options: ["int()", "float()", "str()", "double()"],
        correctAnswer: 1,
        explanation: "`float()` constructor parses floating-point numbers from standard numeric strings or integers.",
        topic: "Data Types"
      },
      {
        questionText: "How do you access the last element of a list named `lst`?",
        options: ["lst[len(lst)]", "lst[-1]", "lst.last()", "lst[end]"],
        correctAnswer: 1,
        explanation: "Python supports negative indexing. Index `-1` refers to the last element, `-2` to the second to last, etc.",
        topic: "Data Structures"
      },
      {
        questionText: "What is the default return value of a function that does not contain a return statement?",
        options: ["0", "False", "None", "Null"],
        correctAnswer: 2,
        explanation: "If no return expression is supplied in a Python function, it implicitly returns the singleton `None`.",
        topic: "Functions"
      }
    ],
    JavaScript: [
      {
        questionText: "Which keyword guarantees a block-scoped variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        correctAnswer: 2,
        explanation: "`const` declares a read-only, block-scoped reference. The identifier cannot be reassigned (though objects can still be mutated).",
        topic: "Scoping"
      },
      {
        questionText: "What is the value of `[] == ![]` in JavaScript?",
        options: ["true", "false", "TypeError", "undefined"],
        correctAnswer: 0,
        explanation: "Due to implicit type coercion, `![]` evaluates to `false` (since an array is truthy). Then `[] == false` converts both to numbers: `0 == 0` which is `true`.",
        topic: "Coercion"
      },
      {
        questionText: "Which method creates a new array with all elements that pass a test function?",
        options: ["map()", "filter()", "forEach()", "reduce()"],
        correctAnswer: 1,
        explanation: "`filter()` returns a new shallow copy array containing elements passing the provided conditional criteria.",
        topic: "Array Operations"
      },
      {
        questionText: "What is the output of `console.log(1 + '2')`?",
        options: ["3", "'12'", "NaN", "TypeError"],
        correctAnswer: 1,
        explanation: "The addition operator `+` triggers string concatenation if any of the operands is a string, evaluating to `'12'`.",
        topic: "Coercion"
      }
    ],
    Math: [
      {
        questionText: "Find the value of x if log₁₀(x) = 3.",
        options: ["x = 30", "x = 100", "x = 1000", "x = 3"],
        correctAnswer: 2,
        explanation: "By logarithmic definition, `log_b(y) = z` is equivalent to `b^z = y`. Here, `10³ = 1000`, so `x = 1000`.",
        topic: "Logarithms"
      },
      {
        questionText: "What is the perimeter of a rectangle with length 8cm and width 5cm?",
        options: ["13cm", "40cm²", "26cm", "20cm"],
        correctAnswer: 2,
        explanation: "The perimeter formula is `P = 2(length + width) = 2(8 + 5) = 2(13) = 26cm`.",
        topic: "Geometry"
      },
      {
        questionText: "Solve: (2x + 4) / 2 = 9",
        options: ["x = 7", "x = 14", "x = 5", "x = 9"],
        correctAnswer: 0,
        explanation: "Multiply by 2: `2x + 4 = 18`. Subtract 4: `2x = 14`. Divide by 2: `x = 7`.",
        topic: "Linear Equations"
      }
    ],
    History: [
      {
        questionText: "Who was the first President of the United States?",
        options: ["Thomas Jefferson", "Benjamin Franklin", "John Adams", "George Washington"],
        correctAnswer: 3,
        explanation: "George Washington took the oath of office in 1789, serving two terms as America's first president.",
        topic: "Leadership"
      },
      {
        questionText: "The Magna Carta was signed by King John in which year?",
        options: ["1066", "1215", "1492", "1776"],
        correctAnswer: 1,
        explanation: "The Magna Carta was drafted and signed at Runnymede in June 1215, establishing the principle that everyone, including the king, is subject to the law.",
        topic: "Key Documents"
      }
    ],
    Science: [
      {
        questionText: "What is the chemical symbol for gold?",
        options: ["Gd", "Ag", "Au", "Pb"],
        correctAnswer: 2,
        explanation: "The chemical symbol for gold is `Au` from its Latin name, 'aurum' (shining dawn).",
        topic: "Chemistry"
      },
      {
        questionText: "Which organelle in plant cells is responsible for carrying out photosynthesis?",
        options: ["Chloroplast", "Mitochondria", "Cell Wall", "Vacuole"],
        correctAnswer: 0,
        explanation: "Chloroplasts contain chlorophyll pigments that absorb solar light energy and convert it to plant glucose.",
        topic: "Cell Biology"
      }
    ]
  };

  try {
    const selectedTopic = topic || "Python";
    const selectedDifficulty = difficulty || "Medium";
    const finalCount = parseInt(count) || 5;

    const pool = questionsPool[selectedTopic] || questionsPool.Python;

    // Shuffle and slice
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(finalCount, shuffled.length));

    // Map to db format questions
    const formattedQuestions = selectedQuestions.map((q, idx) => ({
      id: `ai-gen-${selectedTopic.toLowerCase()}-${idx + 1}-${Date.now()}`,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topic: q.topic,
      imageUrl: null
    }));

    const categoryMap = {
      Python: "Programming",
      JavaScript: "Programming",
      Math: "Math",
      History: "History",
      Science: "Science"
    };

    const customId = `custom-ai-${Date.now()}`;
    const newQuiz = new Quiz({
      id: customId,
      title: `AI Custom: ${selectedTopic}`,
      category: categoryMap[selectedTopic] || "General Knowledge",
      difficulty: selectedDifficulty,
      duration: finalCount * 90, // 90 seconds per question
      questionsCount: formattedQuestions.length,
      rating: 5.0,
      takenCount: 1,
      description: `A custom-generated quiz compiled by our AI engine on the subject of ${selectedTopic}. Built with difficulty level set to ${selectedDifficulty}.`,
      questions: formattedQuestions
    });

    const savedQuiz = await newQuiz.save();

    res.status(201).json({
      success: true,
      message: "AI custom quiz generated and saved to MongoDB successfully",
      data: savedQuiz
    });
  } catch (error) {
    next(error);
  }
};