/*
script to test the 3LM api
*/
const { v1_chat_completions } = require('./web_client');

// const prompt = "Who is Gagarin?";

const prompt_ =  [
    {
      "content": "You are a helpful assistant.",
      "role": "system"
    },
    {
      "content": "What is the capital of GB?",
      "role": "user"
    }
  ];
// const prompt_ = [{ "role": "system", "content": "Given the following conversation, relevant context, and a follow up question, reply with an answer to the current question the user is asking. Return only your response to the question given the above information following the users instructions as needed.\\n    Context:\\n    [CONTEXT 0]:\\nIGOR SOROCHAN\\nCurrently searching for a Data Scientist position\\nPROFESSIONAL EXPERIENCE\\nTraits Main characteristics and qualities Antalya, Turkey (remote work)\\nIntensive and constant self education\\nWell organized, self-disciplined\\nData-driven, passionate about details\\nResponsible and attentive to deadlines\\n2023\\nFindFriend project (Animal shelter aggregator) Antalya, Turkey (remote work)\\nDS Team Lead\\nLeading and managing a team of data\\nscientists\\nDeveloping project plans, timelines, and\\nmilestones\\nAssisting in problem-solving, reviewing\\ncode and models\\nImplementation of CI/CD, models lifecycle\\nmanaging\\nEnforcing best practices, standards, and\\nprocesses Data versioning, experiment\\ntracking, model serving\\nEngaging with senior management and\\nother stakeholders to communicate the\\nvalue and impact of data science initiatives\\nPresenting findings, insights, and\\nrecommendations in a clear and concise\\nmanner\\n2022\\nGitHub online\\nPortfolio\\nGoogle Data Analyst professional\\ncertificate program.\\n[END CONTEXT 0]\\n\\n" }, { "role": "user", "content": "Who is Sorochan?" }];

// console.log(prompt_);
// const prompt = JSON.stringify(prompt_);

v1_chat_completions(prompt_).then(response => {
  if (response) {
    console.log(response);
  } else {
    console.log("Failed to get a valid response.");
  }
});
