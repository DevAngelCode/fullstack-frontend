import { Component } from '@angular/core';
import { ProfileComponent as SharedProfileComponent } from '../../shared/component/profile/profile.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedProfileComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
