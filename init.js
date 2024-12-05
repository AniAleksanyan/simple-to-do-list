const sqlite = require("better-sqlite3")
const db = new sqlite('lists.db')

db.prepare(`
    CREATE TABLE IF NOT EXISTS lists(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       text TEXT,
       completed INTEGER
    )
`).run()

const lists = [
    {text:"Kardal", completed: "0"},
    {text:"film ditel", completed: "0"},
    {text:"ktavy nerkel", completed: "0"},
    {text:"erazel :D", completed: "0"},
]

const stm = `INSERT INTO lists(text, completed) VALUES(@text, @completed)`
lists.forEach(u => {
    db.prepare(stm).run(u)
})