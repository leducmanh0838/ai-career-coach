# Copyright (c) 2026 AURA FARMING 20 PRO MAX
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import logging

import httpx
from django.conf import settings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)

TRANSLATE_URL = (
    "https://translation.googleapis.com/language/translate/v2"
)


class TranslationResult(BaseModel):
    translations: list[str] = Field(
        description="Vietnamese translations in the same order as input."
    )

    @field_validator("translations")
    @classmethod
    def strip_translations(cls, values: list[str]) -> list[str]:
        return [value.strip() for value in values]


def _translate_with_google(
        texts: list[str],
) -> list[str]:
    """Dịch nhiều đoạn bằng Google Translate đồng bộ."""
    with httpx.Client(timeout=20) as client:
        response = client.post(
            TRANSLATE_URL,
            params={"key": settings.GOOGLE_TRANSLATE_API_KEY},
            json={
                "q": texts,
                "source": "en",
                "target": "vi",
                "format": "text",
            },
        )

    response.raise_for_status()

    translations = response.json()["data"]["translations"]
    result = [item["translatedText"] for item in translations]

    if len(result) != len(texts):
        raise ValueError(
            "Google trả về số lượng bản dịch không hợp lệ."
        )

    return result


def _translate_with_openai(
    texts: list[str],
) -> list[str]:
    """Fallback dịch bằng OpenAI qua LangChain và Pydantic (đồng bộ)."""

    if not settings.OPENAI_API_KEY:
        raise RuntimeError("Chưa cấu hình OPENAI_API_KEY")

    if not texts:
        return []

    if not all(isinstance(text, str) for text in texts):
        raise TypeError("Tất cả phần tử trong texts phải là chuỗi.")

    llm = ChatOpenAI(
        model="gpt-4.1-mini",
        api_key=settings.OPENAI_API_KEY,
        temperature=0,
        timeout=30,
        max_retries=1,
    )

    structured_llm = llm.with_structured_output(
        TranslationResult,
        method="json_schema",
    )

    # Sử dụng invoke() thay vì ainvoke()
    raw_result = structured_llm.invoke([
        SystemMessage(
            content=(
                "You are a professional English-to-Vietnamese translator "
                "for an AI career guidance and ESCO occupational skills system. "
                "Translate each input item accurately and naturally. "
                "Preserve technical terminology and meaning. "
                "Do not explain or add information. "
                "Return exactly the same number and order of translations."
            )
        ),
        HumanMessage(
            content=(
                "Translate each of these items into Vietnamese. "
                "Preserve their order and return one translation per item:\n"
                + "\n".join(
                    f"{index}. {text}"
                    for index, text in enumerate(texts, start=1)
                )
            )
        ),
    ])

    result = TranslationResult.model_validate(raw_result)

    translations = result.translations

    if len(translations) != len(texts):
        raise ValueError(
            f"Cần {len(texts)} bản dịch, "
            f"nhưng nhận được {len(translations)}."
        )

    if any(not item.strip() for item in translations):
        raise ValueError("OpenAI trả về bản dịch rỗng.")

    return translations


def translate_texts(
        texts: list[str],
) -> list[str]:
    """Ưu tiên Google; fallback sang OpenAI nếu Google lỗi (đồng bộ)."""
    if not texts:
        return []

    if not all(isinstance(text, str) for text in texts):
        raise TypeError(
            "Tất cả phần tử trong texts phải là chuỗi."
        )

    if not settings.GOOGLE_TRANSLATE_API_KEY:
        logger.warning(
            "Thiếu Google API key, chuyển sang OpenAI."
        )
    else:
        try:
            return _translate_with_google(texts)
        except (
                httpx.HTTPError,
                ValueError,
                KeyError,
                TypeError,
        ) as exc:
            logger.warning(
                "Google Translate thất bại (%s), chuyển sang OpenAI.",
                type(exc).__name__,
            )

    return _translate_with_openai(texts)