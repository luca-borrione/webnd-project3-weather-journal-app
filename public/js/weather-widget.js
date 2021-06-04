let $changeLocationButton;
let $closeModalButton;
let $widget;
let $locationModal;

const storeElements = () => {
  $changeLocationButton = document.getElementById('change-location-button');
  $closeModalButton = document.getElementById('close-modal');
  $widget = document.querySelector('.weather-widget');
  $locationModal = document.querySelector('.location-modal');
};

const toggleModal = () => {
  $locationModal.classList.add('visible');
  setTimeout(() => $widget.classList.toggle('show-modal'), 0);
};

const toggleModalClick = (event) => {
  toggleModal();
  event.preventDefault();
};

const locationModalTransitionEnd = (event) => {
  if (event.propertyName === 'opacity') {
    if (!$widget.classList.contains('show-modal')) {
      $locationModal.classList.remove('visible');
    }
  }
};

const initEventListeners = () => {
  $changeLocationButton.addEventListener('touchend', toggleModalClick);
  $changeLocationButton.addEventListener('click', toggleModalClick);
  $closeModalButton.addEventListener('touchend', toggleModalClick);
  $closeModalButton.addEventListener('click', toggleModalClick);
  $locationModal.addEventListener('transitionend', locationModalTransitionEnd);
};

const init = () => {
  storeElements();
  initEventListeners();
};

document.addEventListener('DOMContentLoaded', init);

export {
  toggleModal
};
