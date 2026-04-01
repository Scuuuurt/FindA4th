import { createRepository } from "./persistence.js";

const repository = createRepository();

export const storageMode = repository.mode;

export function bootstrapState(sessionToken) {
  return repository.bootstrapState(sessionToken);
}

export function signup(payload) {
  return repository.signup(payload);
}

export function login(payload) {
  return repository.login(payload);
}

export function logout(sessionToken) {
  return repository.logout(sessionToken);
}

export function completeOnboarding(sessionToken, payload) {
  return repository.completeOnboarding(sessionToken, payload);
}

export function updateSettings(sessionToken, payload) {
  return repository.updateSettings(sessionToken, payload);
}

export function setFilter(sessionToken, filter) {
  return repository.setFilter(sessionToken, filter);
}

export function swipeProfile(sessionToken, direction) {
  return repository.swipeProfile(sessionToken, direction);
}

export function getTeeTimes(sessionToken) {
  return repository.getTeeTimes(sessionToken);
}

export function getMessages(sessionToken, matchId) {
  return repository.getMessages(sessionToken, matchId);
}

export function sendMessage(sessionToken, matchId, payload) {
  return repository.sendMessage(sessionToken, matchId, payload);
}

export function submitRating(sessionToken, matchId, payload) {
  return repository.submitRating(sessionToken, matchId, payload);
}
