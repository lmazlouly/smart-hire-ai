package com.smarthireai.service;

import java.io.IOException;
import java.util.List;

public interface EmbeddingClient {

    List<Double> embed(String text) throws IOException;
}
