package com.smarthireai.service;

import java.io.IOException;

public interface CvFileDownloader {

    byte[] download(String fileUrl) throws IOException;
}
