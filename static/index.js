const bcrypt = require('bcryptjs');

const secure = async (password) => {
    const hashpass = await bcrypt.hash(password, 10)
    console.log(hashpass);
}

secure("hellowold")