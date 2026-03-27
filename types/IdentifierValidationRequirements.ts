type IdentifierValidationRequirements = {
    targetField: string;
    targetEntity: string;
    regex: RegExp;
    minLength: number;
    maxLength: number;
    errorMsg?: string | undefined;
};

export default IdentifierValidationRequirements
