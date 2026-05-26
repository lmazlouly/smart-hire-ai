package com.smarthireai.service;

import com.smarthireai.dto.CvParseResult;
import java.io.IOException;

public interface CvParsingClient {

    CvParseResult parse(String fileName, byte[] content, String contentType) throws IOException;
}
