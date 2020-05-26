"use strict"

const generator = require('generate-password');

const config = require('../../config/config');

module.exports.checkPasswordStrength = function (password) {
    password = password || '';

    const params = config.passwordRequirements;

    const maxRate = Object.values(params).filter(Boolean).length;

    const isLong = password.length >= params.length;
    const hasLowercase = params.lowercase && /[a-z]/.test(password);
    const hasUppercase = params.uppercase && /[A-Z]/.test(password);
    const hasNumbers = params.numbers && /\d/.test(password);
    const hasSymbols = params.symbols && /\W/.test(password);

    return isLong + hasLowercase + hasUppercase + hasNumbers + hasSymbols >= maxRate;
};

module.exports.generatePassword = function () {
    const options = Object.assign(
        {},
        config.passwordRequirements,
        {excludeSimilarCharacters: true, strict: true}
    );

    return generator.generate(options);
};
