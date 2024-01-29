const express = require("express");
const app = express();
const fs = require("fs"); 
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const port = 3000;

const rottaPublica = path.join(__dirname, "public");
const rottaUploads = path.join(__dirname, "uploads");

const adminAutorizzati = [
  {
    username: 'admin1',
    password: '123456789'
  }
];

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.static(rottaPublica));
app.use(express.static(rottaUploads));

app.use(bodyParser.urlencoded({ extended: true }));
/* gestione json  */
const dati=read();

function read() {
  try {
    const datiJson = fs.readFileSync("dati.json", 'utf-8');
    // Converte il contenuto JSON in un oggetto JavaScript
    return JSON.parse(datiJson);
  } catch (error) {
    console.log(error);
    return [];
  }
}

function write(datiJson) {//scrive nel file json con unaindendazione di uno spazio
  fs.writeFileSync("dati.json", JSON.stringify(datiJson, null, 1), 'utf-8');
  
}

function save() {
  write(dati);
}

//setto le sessioni
app.use(
  session({
    secret: "il-nostro-segreto",
    resave: false,
    saveUninitialized: true,
  })
);

//midleware che verifica se ho gia fatto l'accesso
const verifcaAut = (req, res, next) => {
  if (req.session && req.session.verifcata) {
    return next();
  } else {
    res.redirect("/logAdmin?error=1");
  }
};

//setto lo storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
      cb(null, rottaUploads);//cartella di destinaizone
  },
  filename(req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);//nome del file
  }
});
const upload = multer({//inizializzazione dell'accesso allo storage
  storage: storage
});


/* Rotte */
app.get("/", (req, res) => {
  res.render("index", { dati });
});

app.get("/posts/:id", (req, res) => {
  let post = dati.find(post => post.id == req.params.id);
  let copiaPost = post;//deep copy di post su cui ci posso lavorare in sicurezza
  console.log(copiaPost);
  copiaPost.immagine =copiaPost.immagine;
  res.render("post", { copiaPost });
});

app.post("/admin", (req, res) => {
  const { admin_name, admin_password } = req.body;
  if (admin_name === "admin1" && admin_password === "123456789") {
    req.session.verifcata = true;
    res.redirect("admin");
  } else {
    res.redirect("logAdmin.html?error=1");
  }
});

app.get("/admin", verifcaAut, (req, res) => {
  res.render("admin", { dati });
});

app.get("/log", (req, res) => {
  //pezzo di codice che serve a far in modo che quando si è gia autenticati non ti fa passare per log
  if (req.session.verifcata) {
    res.render("admin", { dati });
  } else {
    const logAdminPath = path.join(__dirname, "public", "logAdmin.html");
    res.sendFile(logAdminPath);
  }
});

app.post("/admin/posts",upload.single('img') ,(req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: dati.length + 1,
    title,
    content,
    immagine: req.file ? req.file.filename: "immagine.jpg",
    Comment: []
  };
  dati.push(newPost);
  save();
  res.redirect("/");
});

app.get("/admin/new", (req, res) => {
  res.render("add-post");
});

app.post("/addCommento/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const autore = req.body.autore;
  const contenuto = req.body.contenuto;

  // Salva il commento come oggetto, potresti volerlo salvare su un database
  const nuovoCommento = {
    username: autore,
    contenuto: contenuto
  };

  const post = dati.find(p => p.id === postId);

  if (post) {
    post.Comment.push(nuovoCommento);
    save();
  }
  
  res.redirect("/posts/" + postId);
});




app.get("/admin/delete/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = dati.findIndex((post) => post.id === postId);
  if (postIndex !== -1) {
    dati.splice(postIndex, 1);
  }
  save();
  res.redirect("/admin");
});

app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
