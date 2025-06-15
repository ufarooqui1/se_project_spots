import { initialCards } from "./cards.js";
import { settings, resetValidation } from "./validation.js";

// DOM elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const profileAddButton = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-profile-modal");
const addModal = document.querySelector("#new-post-modal");

const editFormElement = document.forms["edit-profile-form"];
const addFormElement = document.forms["add-card-form"];

const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const addModalNameInput = addFormElement.querySelector("#add-card-name-input");
const addModalLinkInput = addFormElement.querySelector("#add-card-link-input");

const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const addModalCloseBtn = addModal.querySelector(".modal__close-btn");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

const previewModalImageElement = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

// Modal logic
function handleEsc(event) {
  const openedModal = document.querySelector(".modal.modal_opened");
  if (event.key === "Escape" && openedModal) {
    closeModal(openedModal);
  }
}

function handleOverlayClick(event) {
  if (event.target.classList.contains("modal_opened")) {
    closeModal(event.target);
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEsc);
  modal.addEventListener("click", handleOverlayClick);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEsc);
  modal.removeEventListener("click", handleOverlayClick);
}

// Card logic
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleElement = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");

  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;
  cardTitleElement.textContent = data.name;

  const cardLikeBtnElement = cardElement.querySelector(".card__like-btn");
  cardLikeBtnElement.addEventListener("click", () => {
    cardLikeBtnElement.classList.toggle("card__like-btn_active");
  });

  const cardDeleteBtnElement = cardElement.querySelector(".card__delete-btn");
  cardDeleteBtnElement.addEventListener("click", () => {
    cardElement.remove();
  });

  cardImageElement.addEventListener("click", () => {
    previewModalImageElement.src = data.link;
    previewModalImageElement.alt = data.name;
    previewModalCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

// Universal render function
function renderCard(cardData, method = "append") {
  const cardElement = getCardElement(cardData);
  if (method === "prepend") {
    cardsList.prepend(cardElement);
  } else {
    cardsList.append(cardElement);
  }
}

// Initial card rendering
initialCards.forEach((item) => renderCard(item, "append"));

// Open edit modal
profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings); // Optional: validation utility
  openModal(editModal);
});

// Close modals
editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
addModalCloseBtn.addEventListener("click", () => closeModal(addModal));
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

// Open add modal
profileAddButton.addEventListener("click", () => {
  resetValidation(addFormElement, settings); // Optional: validation utility
  openModal(addModal);
});

// Submit edit form
editFormElement.addEventListener("submit", function (evt) {
  evt.preventDefault();
  profileName.textContent = editModalNameInput.value;
  profileDescription.textContent = editModalDescriptionInput.value;
  closeModal(editModal);
});

// Submit add form
addFormElement.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const inputValues = {
    name: addModalNameInput.value,
    link: addModalLinkInput.value,
  };

  renderCard(inputValues, "prepend");

  addFormElement.reset();
  closeModal(addModal);
});
