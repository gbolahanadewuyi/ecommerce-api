module.exports = {
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        "ecmaVersion": 2018,
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    rules: {
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double", {"allowTemplateLiterals": true}],
        "semi": ["error", "always"],
        "max-len": ["error", {"code": 200}],
        "no-useless-catch": "error",
        "no-restricted-globals": ["error", "name", "length"],
        "prefer-arrow-callback": "error",
        "no-trailing-spaces": ["error", {"skipBlankLines": true}],
        "prefer-promise-reject-errors": "error",
        "require-jsdoc": [
            "error",
            {
                "require": {
                    "FunctionDeclaration": false,
                    "MethodDefinition": false,
                    "ClassDeclaration": false,
                    "ArrowFunctionExpression": false,
                    "FunctionExpression": false,
                },
            },
        ],

        // override configuration set by extending "eslint:recommended"
        "no-empty": "warn",
        "no-cond-assign": ["error", "always"],

        // disable rules from base configurations
        "for-direction": "off",
    },
    overrides: [
        {
            files: ["**/*.spec.*"],
            env: {
                mocha: true,
            },
            rules: {},
        },
    ],
    globals: {},
};
