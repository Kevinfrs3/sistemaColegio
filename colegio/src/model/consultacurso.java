/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author LENOVO
 */
public class consultacurso {

    public static final List<curso> listacurso = new ArrayList<>();

    public boolean agregarcurso(int codigo, String nombre) {
        if (codigo <= 0 || nombre == null || nombre.isBlank() || buscarCurso(codigo) != null) {
            return false;
        }
        curso nuevoCurso = new curso();
        nuevoCurso.setCodigo(codigo);
        nuevoCurso.setNombre(nombre.trim());
        listacurso.add(nuevoCurso);
        return true;
    }

    public boolean editarcurso(int codigo, String nombre) {
        curso cursoExistente = buscarCurso(codigo);
        if (cursoExistente == null || nombre == null || nombre.isBlank()) {
            return false;
        }
        cursoExistente.setNombre(nombre.trim());
        return true;
    }

    public boolean eliminarcurso(int codigo) {
        for (curso cursoExistente : listacurso) {
            if (cursoExistente.getCodigo() == codigo) {
                listacurso.remove(cursoExistente);
                return true;
            }
        }
        return false;
    }

    public curso buscarCurso(int codigo) {
        for (curso cursoExistente : listacurso) {
            if (cursoExistente.getCodigo() == codigo) {
                return cursoExistente;
            }
        }
        return null;
    }

    public List<curso> consultarListaCurso() {
        return new ArrayList<>(listacurso);
    }

    public List<curso> consularlistacurso() {
        return consultarListaCurso();
    }

    public curso consulacursocodigo(int codigo, String nombre) {
        return buscarCurso(codigo);
    }

}
