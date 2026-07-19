<!-- BEGIN:nextjs-agent-rules -->
I'm building a project for UNESCO Youth Hackathon 2026, aimed to promote MIL (Media and Information Literacy) This project has 3 main functions. Basically it's a website that helped people (mainly high school students) to acknowledge deepfake AI, media manipulation and scam/fraud/phising.
The mechanism is like this. You type the code of a card and enter a set of game. A set contains 3 games (or modules).
First you are given a picture of deepfake, you gotta find the off details in it and answer socratic questions about that. Nexst you are given a related topic of paragraphs (simulationally a post or news), where you have to highlight parts you think does not make sense, here usually fallacy, psychological media manipulation, and answer questions about that (planned to use IoU, if user match 70% of the ground truth, based on the json text character coordination), then lastly they are given a sorting games where they try to sort out a scamming message/email or steps about anything, related to the topic of the set game. 
I have the data of a full set of game that we can use to test in public\data\cases.json. You can look into it and check if there are any problems.
I asked Lovable to make me a dumb interface, with modules of each game located in src\components\modules (you are free to modify to achieve our goal).
<!-- END:nextjs-agent-rules -->
