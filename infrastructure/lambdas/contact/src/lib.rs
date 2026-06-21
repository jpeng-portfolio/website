//! Core library for the contact-form Lambda.
//!
//! The binary (`src/main.rs`) is a thin wrapper that wires real AWS / HTTP
//! clients into the pure handler logic that lives here, so that the handler,
//! validation, Turnstile verification, and email orchestration are all
//! unit-testable offline with mocks.

pub mod config;
pub mod email;
pub mod handler;
pub mod turnstile;
pub mod validation;

pub use config::Config;
pub use email::{EmailSender, TemplateStore};
pub use handler::{handle, AppError, Deps};
pub use turnstile::TurnstileVerifier;
pub use validation::{validate, ContactRequest, ValidationError};
