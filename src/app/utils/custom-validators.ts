import { AbstractControl } from "@angular/forms";

export class CustomValidators {
    static requiredIfTrue(controlName: string) {
        return (control: AbstractControl): any => {
            
            const controlContitional = control.root.get(controlName);
            
            if (!control || !controlContitional) {
                return null;
            }

            if (controlContitional.value && !control.value) {
                return { requiredIfTrue: true };
            }
            
            return null;
        };
    }

    static link(controlName: string) {
        return (control: AbstractControl): any => {
            
            const controlLink = control.root.get(controlName);

            if (controlLink) {
                controlLink.updateValueAndValidity();
            }

            return null;
        };
    }

}