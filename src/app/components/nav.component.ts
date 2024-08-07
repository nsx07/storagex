import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ContextItem, ContextMenuComponent } from './context-menu.component';

@Component({
  selector: 'navheader',
  imports: [CommonModule, ContextMenuComponent],
  template: ` <nav
    class="bg-white border-gray-200 px-2 sm:px-4 py-2.5 dark:bg-gray-900 shadow-md sticky top-0 left-0 z-40"
  >
    <div class="container mx-auto flex flex-wrap items-center justify-between">
      <div>
        <a href="#" class="flex select-none">
          <div class="flex items-center">
            <img
              src="../../assets/exs.png"
              class="mr-3 h-6 sm:h-9"
              alt="FlowBite Logo"
            />
          </div>
          <div class="flex flex-col items-start gap-0">
            <span
              class="leading-4 text-lg font-semibold whitespace-nowrap dark:text-white"
              >StorageX</span
            >
            <div
              class="leading-4 text-xs font-thin whitespace-nowrap dark:text-white"
            >
              online file explorer
            </div>
          </div>
        </a>
      </div>

      <div class="flex">
        <button
          class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
          id="theme-toggle"
          type="button"
        >
          <svg
            id="theme-toggle-dark-icon"
            class="w-5 h-5 hidden"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            ></path>
          </svg>
          <svg
            id="theme-toggle-light-icon"
            class="w-5 h-5 hidden"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>

        <button
          (click)="login()"
          class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
          type="button"
        >
          API
        </button>
      </div>
    </div>
  </nav>`,
  standalone: true,
})
export class NavComponent implements OnInit {
  public auth = inject(AuthService);

  context = false;
  loggedIn = false;
  items: ContextItem[] = [];

  async ngOnInit() {
    this.toggleHandler();
  }

  toCapital(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  login() {
    this.auth.input();
  }

  toggleHandler() {
    var themeToggleDarkIcon = document.getElementById(
      'theme-toggle-dark-icon'
    )!;
    var themeToggleLightIcon = document.getElementById(
      'theme-toggle-light-icon'
    )!;

    // Change the icons inside the button based on previous settings
    if (
      localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      themeToggleLightIcon.classList.remove('hidden');
    } else {
      themeToggleDarkIcon.classList.remove('hidden');
    }

    var themeToggleBtn = document.getElementById('theme-toggle')!;

    themeToggleBtn.addEventListener('click', function () {
      // toggle icons inside button
      themeToggleDarkIcon.classList.toggle('hidden');
      themeToggleLightIcon.classList.toggle('hidden');

      // if set via local storage previously
      if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('color-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('color-theme', 'light');
        }

        // if NOT set via local storage previously
      } else {
        if (document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('color-theme', 'light');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('color-theme', 'dark');
        }
      }
    });
  }
}
