import "./index.css";
import {
  settings,
  resetValidation,
  enableValidation,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

// Initialize API with base URL and headers
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "b253eaaf-0f87-4f7c-9999-05664518ebce",
    "Content-Type": "application/json",
  },
});

// Fetch initial app data: cards and user info
api
  .getAppInfo()
  .then(([cards, user]) => {
    console.log("cards data:", cards);
    updateUserInfo(user);

    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

// DOM elements - Profile buttons and display fields
const profileEditButton = document.querySelector(".profile__edit-btn");
const profileAddButton = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

// Update profile info on page from user data
function updateUserInfo(user) {
  profileName.textContent = user.name;
  profileDescription.textContent = user.about;
  profileAvatar.src = user.avatar;
}

// Avatar modal and related elements for avatar updates
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");

// Delete modal and form for confirming card deletion
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");

// Modal for profile editing and adding new cards
const editModal = document.querySelector("#edit-profile-modal");
const addModal = document.querySelector("#new-post-modal");

// Form elements for editing profile and adding cards
const editFormElement = document.forms["edit-profile-form"];
const addFormElement = document.forms["add-card-form"];

// Inputs inside the edit modal for user profile data
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Inputs inside the add card modal for card title and image link
const addModalNameInput = addFormElement.querySelector("#add-card-name-input");
const addModalLinkInput = addFormElement.querySelector("#add-card-link-input");

// Modal close buttons
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const addModalCloseBtn = addModal.querySelector(".modal__close-btn");

// Close modal when cancel button is clicked
document.querySelectorAll(".modal__cancel-btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const modal = event.target.closest(".modal");
    closeModal(modal);
  });
});

// Preview modal for displaying card images
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

// Image and caption elements inside the preview modal
const previewModalImageElement = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

// Card template and list for rendering cards
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

// Variable to keep track of which card is selected for deletion
let selectedCard, selectedCardID;

// Modal keyboard close handler (Esc key)
function handleEsc(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal.modal_opened");
    openedModal && closeModal(openedModal);
  }
}

// Close modal when clicking outside the modal content (overlay click)
function handleOverlayClick(event) {
  if (event.target.classList.contains("modal_opened")) {
    closeModal(event.target);
  }
}

// Open modal: add class, add listeners for Esc key and overlay click
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEsc);
  modal.addEventListener("click", handleOverlayClick);
}

// Close modal: remove class, remove listeners for Esc key and overlay click
function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEsc);
  modal.removeEventListener("click", handleOverlayClick);
}

// Handle avatar form submission to update user avatar
function handleAvatarSubmit(event) {
  event.preventDefault();

  const submitButton = event.submitter;
  setButtonText(submitButton, true, "Save", "Saving...");

  api
    .editAvatarUserInfo({ avatar: avatarInput.value })
    .then((data) => {
      updateUserInfo(data);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
}

// Prepare to delete a card: save selected card, and open delete modal
function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardID = data._id;
  openModal(deleteModal);
}

// Toggle like button active state based on card's like status
function toggleLikeButton(button, isLiked) {
  console.log("Toggling class", isLiked);
  console.log("Button before toggle:", button.className);
  button.classList.toggle("card__like-btn_active", isLiked);
  console.log("Button after toggle:", button.className);
}

// Handle like button click: call API to toggle like status
function handleLikeButtonClick(cardId, likeBtn) {
  return () => {
    const isCurrentlyLiked = likeBtn.classList.contains(
      "card__like-btn_active"
    );

    api
      .changeLikeStatus(cardId, isCurrentlyLiked)
      .then((updatedCard) => {
        // Use the response to set class correctly
        if (updatedCard.isLiked) {
          likeBtn.classList.add("card__like-btn_active");
        } else {
          likeBtn.classList.remove("card__like-btn_active");
        }
      })
      .catch(console.error);
  };
}

// Return a function to handle delete button click that opens delete modal
function handleDeleteButtonClick(cardElement, data) {
  return () => handleDeleteCard(cardElement, data);
}

// Handle clicking on card image to open preview modal with larger image
function handleImageClick(data) {
  return () => {
    previewModalImageElement.src = data.link;
    previewModalImageElement.alt = data.name;
    previewModalCaption.textContent = data.name;
    openModal(previewModal);
  };
}

// Create a card DOM element from data, add event listeners for like, delete, and image preview
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleElement = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");
  const cardDeleteBtnElement = cardElement.querySelector(".card__delete-btn");

  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;
  cardTitleElement.textContent = data.name;

  const cardLikeBtnElement = cardElement.querySelector(".card__like-btn");
  if (data.isLiked) {
    cardLikeBtnElement.classList.add("card__like-btn_active");
  }

  cardLikeBtnElement.addEventListener(
    "click",
    handleLikeButtonClick(data._id, cardLikeBtnElement)
  );

  cardDeleteBtnElement.addEventListener(
    "click",
    handleDeleteButtonClick(cardElement, data)
  );

  cardImageElement.addEventListener("click", handleImageClick(data));

  return cardElement;
}

// Render a card to the cards list; prepend or append depending on the method
function renderCard(cardData, method = "append") {
  const cardElement = getCardElement(cardData);
  if (method === "prepend") {
    cardsList.prepend(cardElement);
  } else {
    cardsList.append(cardElement);
  }
}

// Open profile edit modal and prefill inputs with current profile data
profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings); // Optional: validation utility
  openModal(editModal);
});

// Close modals when their close button is clicked
document.querySelectorAll(".modal__close-btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    const modal = event.target.closest(".modal");
    closeModal(modal);
  });
});

// Open add new card modal
profileAddButton.addEventListener("click", () => {
  addFormElement.reset();
  resetValidation(addFormElement, settings);

  const submitButton = addFormElement.querySelector(
    settings.submitButtonSelector
  );
  disableButton(submitButton, settings);

  openModal(addModal);
});

// Submit edited profile info and update server and UI
editFormElement.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true, "Save", "Saving...");

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      updateUserInfo(data);
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
});

// Open avatar update modal with validation reset
avatarModalBtn.addEventListener("click", () => {
  avatarInput.value = "";
  resetValidation(avatarForm, settings);
  openModal(avatarModal);
});

// Handle avatar form submission
avatarForm.addEventListener("submit", handleAvatarSubmit);

// Handle new card form submission: send to API, render in UI, reset form, and close modal
addFormElement.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true);

  const inputValues = {
    name: addModalNameInput.value,
    link: addModalLinkInput.value,
  };

  api
    .addCard(inputValues)
    .then((cardData) => {
      renderCard(cardData, "prepend");
      addFormElement.reset();

      const submitButton = evt.submitter;
      disableButton(submitButton, settings);

      closeModal(addModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false);
    });
});

// Delete card confirmation from submit: call API to delete, remove from UI, close modal
deleteForm.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardID)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false, "Delete", "Deleting...");
    });
});

// Enable form validation on all forms with provided settings
enableValidation(settings);
