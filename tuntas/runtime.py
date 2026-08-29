import logging
from uuid import uuid4

from tuntas.config import APP_NAME


logger = logging.getLogger(__name__)


class AgentRuntimeError(RuntimeError):
    """Raised when ADK or Gemini cannot produce a safe final response."""


async def run_quakeops_agent(prompt: str) -> str:
    try:
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService
        from google.genai import types

        from tuntas.agent import root_agent

        user_id = "quakeops-demo"
        session_id = str(uuid4())
        session_service = InMemorySessionService()
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )
        runner = Runner(
            agent=root_agent,
            app_name=APP_NAME,
            session_service=session_service,
        )
        message = types.Content(
            role="user",
            parts=[types.Part(text=prompt)],
        )

        final_text = ""
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=message,
        ):
            if not event.is_final_response() or not event.content:
                continue
            final_text = "\n".join(
                part.text
                for part in (event.content.parts or [])
                if getattr(part, "text", None)
            ).strip()

        if not final_text:
            raise AgentRuntimeError("ADK returned no final text response")
        return final_text
    except AgentRuntimeError:
        raise
    except Exception as exc:
        logger.exception("TUNTAS ADK mission failed")
        raise AgentRuntimeError("ADK mission execution failed") from exc
