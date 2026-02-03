# trading_bot/bot/logging_config.py
"""
Logging configuration with rotating file handler.
"""

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logger(name: str = "trading_bot", log_dir: str = "logs") -> logging.Logger:
    """
    Set up logger with rotating file handler.
    
    Args:
        name: Logger name
        log_dir: Directory to store log files
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create log directory if it doesn't exist
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)
    
    # Create rotating file handler (1MB max, 3 backups)
    log_file = log_path / "trading_bot.log"
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=1024 * 1024,  # 1MB
        backupCount=3,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    
    # Create console handler for errors
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.ERROR)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


def sanitize_params(params: dict) -> dict:
    """
    Sanitize parameters for logging (redact sensitive data).
    
    Args:
        params: Parameters dictionary
    
    Returns:
        Sanitized copy of parameters
    """
    sanitized = params.copy()
    
    # Redact signature
    if "signature" in sanitized:
        sanitized["signature"] = "[REDACTED]"
    
    return sanitized
