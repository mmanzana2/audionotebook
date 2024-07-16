const startRecordBtn = document.getElementById('start-record-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTextarea = document.getElementById('note-textarea');
const notesList = document.getElementById('notes-list');
const instructions = document.getElementById('recording-instructions');
const progressBar = document.getElementById('progress-bar');
const badge1 = document.getElementById('badge1');
const badge2 = document.getElementById('badge2');
const badge3 = document.getElementById('badge3');

let recognition;
let noteContent = '';
let noteCount = 0;

// Initialize Web Speech API
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        instructions.textContent = 'Voice recognition activated. Try speaking into the microphone.';
    };

    recognition.onspeechend = function() {
        instructions.textContent = 'You were quiet for a while so voice recognition turned itself off.';
    };

    recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            instructions.textContent = 'No speech was detected. Try again.';
        }
    };

    recognition.onresult = function(event) {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                noteContent += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        noteTextarea.value = noteContent + interimTranscript;
    };
} else {
    instructions.textContent = 'Your browser does not support speech recognition. Try Google Chrome.';
}

startRecordBtn.addEventListener('click', () => {
    if (noteContent.length) {
        noteContent += ' ';
    }
    recognition.start();
});

saveNoteBtn.addEventListener('click', () => {
    recognition.stop();

    if (!noteContent.length) {
        instructions.textContent = 'Could not save empty note. Please add a message to your note.';
    } else {
        saveNote(new Date().toLocaleString(), noteContent);
        noteContent = '';
        renderNotes(getAllNotes());
        noteTextarea.value = '';
        instructions.textContent = 'Note saved successfully.';
        updateProgress();
    }
});

function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
    noteCount++;
}

function getAllNotes() {
    let notes = [];
    const keys = Object.keys(localStorage);
    for (let key of keys) {
        if (key.startsWith('note-')) {
            notes.push({
                dateTime: key.replace('note-', ''),
                content: localStorage.getItem(key)
            });
        }
    }
    return notes;
}

function renderNotes(notes) {
    notesList.innerHTML = '';
    if (notes.length) {
        for (let note of notes) {
            const li = document.createElement('li');
            li.textContent = `${note.dateTime}: ${note.content}`;
            notesList.appendChild(li);
        }
    } else {
        notesList.innerHTML = '<li>No saved notes.</li>';
    }
}

function updateProgress() {
    let progress = Math.min((noteCount / 10) * 100, 100);
    progressBar.style.width = progress + '%';

    if (noteCount >= 10 && noteCount < 20) {
        badge1.style.backgroundColor = '#ffd700';
    } else if (noteCount >= 20 && noteCount < 30) {
        badge2.style.backgroundColor = '#c0c0c0';
    } else if (noteCount >= 30) {
        badge3.style.backgroundColor = '#ff4500';
    }
}

// Initial rendering of saved notes and progress
renderNotes(getAllNotes());
noteCount = getAllNotes().length;
updateProgress();
