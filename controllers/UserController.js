const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const UserController = {
  async register(req, res) {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser = await User.create({
          username: username,
          email: email,
          password: hashedPassword,
        });
  
        const userId = newUser.id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
        res.json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor');
      }
  },

  async login(req, res) {
    try {
        const { email, password } = req.body;
  
        const user = await User.findOne({ where: { email: email } });
  
        if (!user) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
  
        const isPasswordValid = await user.comparePassword(password);
  
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
  
        const userId = user.id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
        res.json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor');
      }
  },

  async forgotPassword(req, res) {
        try {
          const { email } = req.body;
    
          const user = await User.findOne({ where: { email: email } });
    
          if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
          }
    
          const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
    
          await PasswordResetToken.create({
            userId: user.id,
            token: resetToken,
          });
    
          // Envia um e-mail ao usuário com o link de redefinição de senha
          const resetLink = `http://seu-servidor/reset-password?token=${resetToken}`;
          sendPasswordResetEmail(user.email, resetLink);
    
          res.json({ message: 'Um e-mail foi enviado para a recuperação de senha' });
        } catch (error) {
          console.error(error);
          res.status(500).send('Erro interno no servidor');
        }

  },

  async resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
  
        const tokenData = jwt.verify(token, process.env.JWT_RESET_SECRET);
  
        const storedToken = await PasswordResetToken.findOne({
          where: {
            userId: tokenData.userId,
            token: token,
          },
        });
  
        if (!storedToken) {
          return res.status(400).json({ error: 'Token inválido' });
        }
  
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (tokenData.exp < currentTimestamp) {
          return res.status(400).json({ error: 'Token expirado' });
        }
  
        const user = await User.findByPk(tokenData.userId);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
  
        await storedToken.destroy();
  
        res.json({ message: 'Senha redefinida com sucesso' });
      } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor');
      }
  },

  async profile(req, res) {
    try {
        const token = req.headers.authorization.split(' ')[1];
  
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
  
        const user = await User.findByPk(tokenData.userId, {
          attributes: ['id', 'username', 'email'], 
        });
  
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
  
        res.json({ user });
      } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno no servidor');
      }
    },
};

module.exports = UserController;
