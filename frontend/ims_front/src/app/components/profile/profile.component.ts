import { Component, ElementRef, HostListener, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription, Subject, Observable, forkJoin } from 'rxjs';
import { faPen, faTrashCan, faXmark, faBell, faBellSlash, faEllipsisVertical, faSort } from '@fortawesome/free-solid-svg-icons';
import { Menu, Product } from 'src/app/interface/Product';
import { ToastrService } from 'ngx-toastr';
import { OwnerService } from 'src/app/services/owner/owner.service';
import { Owner } from 'src/app/interface/Owner';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
  }

  isLoading: boolean = false;
  isFormOpen: boolean = false;
  isUpdating: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faBell = faBell;
  faBellSlash = faBellSlash;
  faEllipsisVertical = faEllipsisVertical;
  faSort = faSort;

  profiles: Owner[] = [];

  profile: Owner = {
    first_name: '',
    last_name: '',
    business_name: '',
    business_address: '',
    phone: '',
    email: '',
  }

  originalProfile: Owner = {
    first_name: '',
    last_name: '',
    business_name: '',
    business_address: '',
    phone: '',
    email: '',
  }

  constructor(
    private ownerService: OwnerService,
    private toastr: ToastrService,
    private uiService: UiService,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.ownerService.getOwners()
    .subscribe({
      next: (data) => {
        this.isLoading = false;
        this.profiles = data;
        this.isFormOpen = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.uiService.displayErrorMessage(error);
      }
    })
  }

  ngAfterViewInit(): void {

  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  toggleUpdating() {
    this.isUpdating = !this.isUpdating;
  }

  onSubmit(profileForm: NgForm) {
    if (this.isUpdating) {
      this.confirmEdit();
    } else {
      this.createProfile(profileForm);
    }
  }

  createProfile(profileForm: NgForm) {
    if (profileForm.invalid) {
      this.toastr.error("Please fill-in all the required fields.")
      return;
    };

    const formattedProfile = {
      ...this.profile,
      first_name: this.profile.first_name.toUpperCase(),
      last_name: this.profile.last_name.toUpperCase(),
      business_name: this.profile.business_name.toUpperCase(),
      business_address: this.profile.business_address.toUpperCase(),
    }

    this.ownerService.addOwner(formattedProfile)
    .subscribe({
      next: (data) => {
        this.profiles.push(data);
        profileForm.reset();
        this.toggleForm();
        this.toastr.success("Business profile has been successfully saved")
      },
      error: (error) => {
        this.uiService.displayErrorMessage(error);
      }
    })
  }

  editProfile() {
    this.toggleUpdating();
    this.toggleForm();
    this.profile = {...this.profiles[0]};
    this.originalProfile = {...this.profiles[0]};
  }

  confirmEdit() {
    if (JSON.stringify(this.profile) === JSON.stringify(this.originalProfile)) {
      this.toggleForm();
      this.toggleUpdating();
      return;
    };

    const formattedProfile = {
      ...this.profile,
      first_name: this.profile.first_name.toUpperCase(),
      last_name: this.profile.last_name.toUpperCase(),
      business_name: this.profile.business_name.toUpperCase(),
      business_address: this.profile.business_address.toUpperCase(),
    }

    this.isLoading = true;
    this.ownerService.editOwner(formattedProfile)
    .subscribe({
      next: (data) => {
        this.isLoading = false;
        const index = this.profiles.findIndex(profileData => profileData.id === data.id);
        this.profiles[index] = data;
        this.toggleForm();
        this.toggleUpdating();
        this.toastr.success("Business profile has been successfully updated.")
      },
      error: (error) => {
        this.isLoading = false;
        this.uiService.displayErrorMessage(error);
      }
    })
  }
}
