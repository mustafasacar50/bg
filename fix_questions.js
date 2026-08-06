const fs = require('fs');
const path = './src/data/questions.json';
const questions = JSON.parse(fs.readFileSync(path, 'utf8'));

// Fix q_blank_auto_183
const q1 = questions.find(q => q.id === 'q_blank_auto_183');
if (q1) {
    q1.sentence = "Aşağıdaki kelimenin TEKİL halini yazınız: ЖЕНИ";
    q1.hint = "Anlamı: Kadınlar";
}

// Fix q_blank_auto_184
const q2 = questions.find(q => q.id === 'q_blank_auto_184');
if (q2) {
    q2.sentence = "Aşağıdaki kelimenin TEKİL halini yazınız: ВРАТИ";
    q2.hint = "Anlamı: Kapılar";
}

// Fix q_mcq_sentence_183
const q3 = questions.find(q => q.id === 'q_mcq_sentence_183');
if (q3) {
    q3.question = "Aşağıdaki ifadenin doğru tekil-çoğul eşleştirmesini bulunuz:\n\n**KADIN → KADINLAR**";
}

// Fix q_mcq_sentence_184
const q4 = questions.find(q => q.id === 'q_mcq_sentence_184');
if (q4) {
    q4.question = "Aşağıdaki ifadenin doğru tekil-çoğul eşleştirmesini bulunuz:\n\n**KAPI → KAPILAR**";
}

// Fix q_mcq_sentence_174
const q5 = questions.find(q => q.id === 'q_mcq_sentence_174');
if (q5) {
    q5.question = "Aşağıdaki Bulgarca harfin okunuşu nedir?\n\n**Щ**";
}

fs.writeFileSync(path, JSON.stringify(questions, null, 2), 'utf8');
console.log('Questions updated successfully.');
