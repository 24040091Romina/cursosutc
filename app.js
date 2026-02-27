const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

console.log('🚀 Iniciando servidor...');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: 'mi_clave_secreta_123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30 }
}));

// Servir archivos estáticos
app.use(express.static('public'));

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cursosonline'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
  } else {
    console.log('✅ Conectado a MySQL correctamente');
  }
});

// Hacer disponible la conexión para las rutas
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Ruta para obtener cursos
app.get('/api/cursos', (req, res) => {
  const query = 'SELECT * FROM curso ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener cursos:', err);
      return res.json([]);
    }
    res.json(results);
  });
});

// Ruta para login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }
  
  db.query(
    'SELECT id, nombre, email FROM usuarios WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        console.error('❌ Error en login:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      const usuario = results[0];
      req.session.usuario = usuario;
      
      req.session.save(() => {
        res.json({
          mensaje: 'Login exitoso',
          usuario: usuario
        });
      });
    }
  );
});

// Ruta para verificar sesión
app.get('/api/sesion', (req, res) => {
  if (req.session.usuario) {
    res.json({ activa: true, usuario: req.session.usuario });
  } else {
    res.json({ activa: false });
  }
});

// Ruta para logout
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/index.html');
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});