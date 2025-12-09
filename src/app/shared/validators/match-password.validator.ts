import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswordValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.get(passwordField);
        const confirmPassword = control.get(confirmPasswordField);

        if (!password || !confirmPassword) {
            return null;
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ mismatch: true });
            return { mismatch: true };
        } else {
            if (confirmPassword.hasError('mismatch')) {
                delete confirmPassword.errors!['mismatch'];
                if (Object.keys(confirmPassword.errors!).length === 0) {
                    confirmPassword.setErrors(null);
                }
            }
            return null;
        }
    };
}
