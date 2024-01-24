const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const port=3000;

app.set('view engine', 'pug');
app.set('views', './views');

// Dati del blog (esempio)
const posts = [
  { id: 1, title: 'casa', content: 'Contenuto del primo post.Contenuto del primo post. ' },
  { id: 2, title: 'macchina', content: 'Contenuto del secondo post.Contenuto del secondo post.' },
  // Aggiungi altri post se necessario...
];

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'il-nostro-segreto',
  resave: false,
  saveUninitialized: true,
}));

const verifcaAut = (req, res, next) => {
  if (req.session && req.session.verifcata) {
    return next();
  } else {
    res.redirect('/logAdmin?error=1');
  }
};


app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(post => post.id === postId);
  res.render('post', { post });
});
 
app.post('/admin',(req,res)=>{
  const { admin_name, admin_password } = req.body;
  if (admin_name==='admin1' && admin_password==='123456789') {
    req.session.verifcata=true;
    res.redirect('admin');
  }else{
    res.redirect('logAdmin.html?error=1');
  }
});

app.get('/admin',verifcaAut,(req, res) => {
  res.render('admin',{ posts });
});

app.get('/log',(req, res) => {//pezzo di codice che serve a far in modo che quando si è gia autenticati non ti fa passare per log
  if (req.session.verifcata) {
    res.render('admin',{ posts });
  }else{
    const logAdminPath = path.join(__dirname, 'public', 'logAdmin.html');
    res.sendFile(logAdminPath);
  }
});

app.post('/admin/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: posts.length + 1,
    title,
    content
  };
  posts.push(newPost);
  res.redirect('/');
});


app.get('/admin/new', (req, res) => {
  res.render('add-post');
});

app.get('/admin/delete/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts.splice(postIndex, 1);
  }
  res.redirect('/admin');
});





app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});