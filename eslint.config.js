import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import { parser } from 'typescript-eslint';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,jsx,ts}'],
        extends: [js.configs.recommended],
        languageOptions: {
            parser,
            ecmaVersion: 2020,
            globals: globals.node,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
    },
    {
        plugins: { '@stylistic': stylistic },

        rules: {
            // ESLint Stylistic Plugin Rules:

            // Long strings (including comments) are exempt from this rule, and shouldn't be broken up
            '@stylistic/max-len': [
                'warn',
                {
                    code: 80,
                    ignoreComments: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],
            '@stylistic/no-mixed-operators': 'warn',
            '@stylistic/spaced-comment': ['warn', 'always'],

            'prefer-const': 'warn',
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

            'no-async-promise-executor': 'error',
            'require-await': 'error',

            'no-throw-literal': 'error',

            'no-var': 'error',
            'no-object-constructor': 'error',
            'object-shorthand': 'warn',
            'prefer-object-spread': 'warn',
            'no-array-constructor': 'error',
            'prefer-destructuring': 'warn',
            quotes: ['warn', 'single'],
            'prefer-template': 'warn',

            // "eval()" can open an application to vulnerabilities
            'no-eval': 'error',

            // Similar to "eval()"
            'no-new-func': 'error',

            'no-useless-escape': 'warn',
            'func-names': ['error', 'as-needed'],
            'no-loop-func': 'error',
            'prefer-rest-params': 'error',

            // Might not work as expected
            camelcase: ['error', { properties: 'never' }],

            'default-param-last': 'error',
            'prefer-spread': 'error',
            'prefer-arrow-callback': 'error',
            'arrow-body-style': ['warn', 'as-needed'],
            'no-useless-constructor': 'error',
            'class-methods-use-this': 'warn',
            'no-duplicate-imports': 'error',

            // Can switch to: "dot-notation": ["warn", { "allowKeywords": false }]
            'dot-notation': 'warn',

            'prefer-exponentiation-operator': 'warn',
            'no-undef': 'error',

            // "never" ensures variable declarations are split
            'one-var': ['error', 'never'],

            'no-multi-assign': 'error',

            // Used due to potential errors caused by automatic semicolon insertions
            'no-plusplus': 'error',

            'no-use-before-define': 'error',
            eqeqeq: 'error',
            'no-nested-ternary': 'error',
            'no-unneeded-ternary': 'error',
            'no-else-return': ['warn', { allowElseIf: false }],
            'no-new-wrappers': 'error',
            radix: 'error',

            // Exceptions: "e" for errors, "a" and "b" for sorting arrays, "i" and "j" for iterators
            'id-length': ['warn', { exceptions: ['e', 'a', 'b', 'i', 'j'] }],

            // Includes options you might want to add
            'new-cap': ['error', { capIsNewExceptions: ['Router'] }],

            'no-underscore-dangle': 'warn',
            'no-restricted-globals': [
                'error',
                {
                    name: 'isFinite',
                    message:
                        'Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite',
                },
                {
                    name: 'isNaN',
                    message:
                        'Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan',
                },
            ],
        },
    },
]);
