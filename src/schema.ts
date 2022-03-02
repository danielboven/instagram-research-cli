const schema = {
    'Do you wear Nike?': {
        type: 'string',
        options: {
            'Altijd!': 'Always',
            'Regelmatig': 'Frequently',
            'Soms': 'Occasionally',
            'Nooit': 'Never'
        }
    },
    'Offers high quality products and services': {
        type: 'float'
    },
    'Offers products and services that are a good value for the money': {
        type: 'float'
    },
    'Stands behind its products and services': {
        type: 'float'
    },
    'Meets customer needs': {
        type: 'float'
    },
    'Acts responsibly to protect the environment': {
        type: 'float'
    },
    'Supports good causes': {
        type: 'float'
    },
    'Has a positive influence on society': {
        type: 'float'
    },
    'Is open and transparent about the way the company operates': {
        type: 'float'
    },
    'Behaves ethically': {
        type: 'float'
    },
    'Is fair in the way it does business': {
        type: 'float'
    },
    'Age': {
        type: 'integer',
        maxValue: 22
    },
    'Gender': {
        type: 'string',
        options: {
            'Man': 'Male',
            'Vrouw': 'Female',
            'X': 'X'
        }
    }
}

export default schema
