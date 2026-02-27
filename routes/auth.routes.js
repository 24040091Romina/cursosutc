// routes/auth.routes.js
const express = require('express');
const router = express.Router();

// REGISTRO (SIN BCRYPT)
router.post('/registro', (req, res) => {
  const { nombre, email, password } = req.body;
  const db = req.db;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }

  // Verificar si el email ya existe
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al verificar email:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Insertar nuevo usuario (contraseña en texto plano - SIN ENCRIPTAR)
    db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, password],
      (err, result) => {
        if (err) {
          console.error('Error al crear usuario:', err);
          return res.status(500).json({ error: 'Error al crear usuario' });
        }

        res.status(201).json({
          mensaje: 'Registro exitoso',
          usuario: {
            id: result.insertId,
            nombre,
            email
          }
        });
      }
    );
  });
});

// LOGIN (SIN BCRYPT)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  console.log('Intento de login:', { email, password });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  // Buscar usuario directamente (comparación simple de texto plano)
  db.query(
    'SELECT id, nombre, email FROM usuarios WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        console.error('Error al buscar usuario:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      console.log('Resultados:', results);

      if (results.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const usuario = results[0];
      req.session.usuario = usuario;

      req.session.save((err) => {
        if (err) {
          console.error('Error al guardar sesión:', err);
          return res.status(500).json({ error: 'Error al iniciar sesión' });
        }

        res.json({
          mensaje: 'Login exitoso',
          usuario: usuario,
          redirect: '/dashboard.html'
        });
      });
    }
  );
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.redirect('/index.html');
  });
});

module.exports = router;