const express = require('express');
const router = express.Router();

const {
    userSync
} = require('../controllers/userSyncController');


// =====================================================
// LARAVEL -> NODE USER SYNC
// =====================================================

router.post('/user-sync', userSync);


module.exports = router;